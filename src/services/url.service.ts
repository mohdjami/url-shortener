import { customAlphabet } from "nanoid";
import { randomBytes } from "crypto";
import { createClient } from "@/supabase/server";
import { redis } from "@/lib/redis";
import { slugSchema, UrlSchema } from "@/lib/validations/urls";
import { NextResponse } from "next/server";

interface URLRecord {
  id: number;
  original_url: string;
  short_slug: string;
  created_at: Date;
  expires_at?: Date;
}

export class URLShortenerService {
  private readonly SLUG_LENGTH = 7;
  private readonly MAX_RETRIES = 3;
  private readonly BASE62_CHARS =
    "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  private readonly nanoid: (size?: number) => string;
  private readonly redis;
  constructor(private readonly supabase = createClient()) {
    // Initialize nanoid with our custom alphabet
    this.nanoid = customAlphabet(this.BASE62_CHARS, this.SLUG_LENGTH);
    this.redis = redis;
  }

  async createShortURL(
    originalURL: string,
    userId: string,
    code?: string,
    expiresIn?: number
  ): Promise<string> {
    let attempts = 0;

    while (attempts < this.MAX_RETRIES) {
      try {
        // Generate a random slug using nanoid
        if (!code) code = this.nanoid();

        // Calculate expiration date if provided
        const expiresAt = expiresIn
          ? new Date(Date.now() + expiresIn * 1000)
          : null;

        const parsedCode = slugSchema.parse({ slug: code });
        const parsedUrl = UrlSchema.parse({ originalURL });

        const slugExists = await this.findSlug(parsedCode.slug);
        const urlExist = await this.urlExists(userId, parsedUrl.url);
        if (slugExists || urlExist) {
          NextResponse.json({
            error: `${slugExists} and ${urlExist} already exists`,
            status: 409,
          });
        }

        // Try to insert the URL record
        const { error: InsertError } = await this.supabase
          .from("Url")
          .insert({
            originalUrl: originalURL,
            shortUrl: code,
            userId,
          })
          .single();

        if (InsertError) {
          // If it's a unique constraint violation, retry
          if (InsertError.code === "23505") {
            // PostgreSQL unique violation code
            attempts++;
            continue;
          }
          throw new Error(`Failed to create short URL: ${InsertError.message}`);
        }

        // Store the original URL in Redis
        await this.redis.set(code, originalURL, "EX", 60 * 60 * 24 * 7); // expire in one week
        return code; // Return the generated code instead of originalURL
      } catch (error) {
        console.log(error);
        attempts++;
        if (attempts === this.MAX_RETRIES) {
          throw new Error(
            "Failed to generate unique slug after maximum retries"
          );
        }
      }
    }

    throw new Error("Failed to generate short URL");
  }

  async getOriginalURL(slug: string): Promise<string> {
    const { data, error } = await this.supabase
      .from("Url")
      .select("originalUrl, expiresAt")
      .eq("shortUrl", slug)
      .single();

    if (error || !data) {
      throw new Error("Short URL not found");
    }

    // Check if URL has expired
    if (data.expiresAt && new Date(data.expiresAt) < new Date()) {
      throw new Error("Short URL has expired");
    }

    return data.originalUrl;
  }
  async findSlug(slug: string) {
    const { data: url, error } = await this.supabase
      .from("Url")
      .select("*")
      .eq("shortUrl", slug)
      .single();
    if (error) {
      console.log(error);
      return null;
    }
    return url;
  }

  async urlExists(
    userId: string,
    parsedUrl?: string | null,
    shortUrl?: string | null
  ) {
    try {
      if (shortUrl) {
        const { data: url, error } = await this.supabase
          .from("Url")
          .select("*")
          .eq("shortUrl", shortUrl)
          .eq("userId", userId)
          .single();
        if (error) {
          console.log(error);
          return null;
        }
        return url;
      }
      const { data: url, error } = await this.supabase
        .from("Url")
        .select("*")
        .eq("originalUrl", parsedUrl)
        .eq("userId", userId)
        .single();
      if (error) {
        console.log(error);
        return null;
      }
      return url;
    } catch (error) {
      return new Response(null, {
        status: 500,
      });
    }
  }
  async getALLUrls(userId: string) {
    try {
      const { data: urls, error } = await this.supabase
        .from("Url")
        .select("*")
        .eq("userId", userId);
      if (error) {
        console.log(error);
        return null;
      }
      return urls;
    } catch (error) {
      return new Response(null, {
        status: 500,
      });
    }
  }

  // Additional utility methods

  private generateRandomOffset(): number {
    // Generate a random offset to prevent sequential guessing
    const buffer = randomBytes(4);
    return buffer.readUInt32BE(0);
  }
}
