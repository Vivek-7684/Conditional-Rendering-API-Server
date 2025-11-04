import * as z from "zod";

export const productSchema = z.object({
  id: z.coerce
    .number("Id must be Number")
    .positive("Positive Id is Required")
    .optional(),
  name: z
    .string()
    .trim()
    .min(3, "Aleast 3 Character Alphabet is required")
    .optional(),

  maxPrice: z.coerce
    .number("Max Price must be Number")
    .refine((val) => val >= 1000, {
      message: "Max Price must be at least 1000",
    })
    .optional(),
  minPrice: z.coerce
    .number("Min Price must be Number")
    .min(500, "Min Price must be at least 500")
    .optional(),
  category: z
    .enum(["Electronics", "Cloth", "Accessories", "Sports"], {
      message:
        "Category like Electronics, Cloth, Accessories and Sports are only allowed",
    })
    .optional(),
});

