import * as z from "zod";
import sanitizeHtml from "sanitize-html";

export const productSchema = z
  .object({
    id: z.coerce
      .number("Id must be Number")
      .positive("Positive Id is Required")
      .optional(),
    name: z
      .string()
      .regex(/^[A-Za-z ]+$/, { message: "only Alphabets are allowed" })
      .refine(
        (val) => {
          for (let i = 0; i < val.length; i++) {
            if (
              !(val[i] >= "A" && val[i] <= "Z") ||
              (val[i] >= "a" && val[i] <= "z")
            ) {
              return true;
            }
          }
          return false;
        },
        { message: "Alphabets are only allowed." }
      )
      .min(3, "Aleast 3 Character Alphabet is required")
      // .transform((val) =>
      //   sanitizeHtml(val, {
      //     allowedTags: [],
      //     allowedAttributes: [],
      //   })
      // )
      .optional(),

    maxPrice: z.coerce
      .number("Max Price must be Number")
      .refine((val) => val >= 1000, {
        // if condition fails,then error
        message: "Max Price must be at least 1000",
      })
      .optional(),
    minPrice: z.coerce
      .number("Min Price must be Number")
      .refine((val) => val >= 500, {
        message: "Min Price must be at least 500",
      })
      .optional(),
    category: z
      .enum(["Electronics", "Cloth", "Accessories", "Sports"], {
        message:
          "Category like Electronics, Cloth, Accessories and Sports are only allowed",
      })
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (data.minPrice >= data.maxPrice) {
      ctx.addIssue({
        code: "custom",
        message: "Min Price will less than Max Price",
        path: ["minPrice"],
      });
    }
  });
