import { z } from "zod";

export const updateProfileSchema = z.object({
  displayName: z.string().min(1).max(50).optional(),
  dateOfBirth: z.string().refine((d) => !isNaN(Date.parse(d))).optional(),
  gender: z.enum(["male", "female"]).optional(),
  avatarEmoji: z.string().optional(),
});

export const createMeasurementSchema = z.object({
  weight: z.number().min(0.5).max(200),
  height: z.number().min(20).max(250),
  note: z.string().max(200).optional(),
  date: z.string().refine((d) => !isNaN(Date.parse(d))),
});
