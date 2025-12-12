// feedback-schema.ts
import { z } from "zod";

export const feedbackResponseSchema = z.object({
  _id: z.string(),
  message: z.string(),
  respondedBy: z.object({
    _id: z.string(),
    name: z.string(),
  }).nullable(),
  respondedAt: z.string().or(z.date()),
});

export const feedbackSchema = z.object({
  _id: z.string(),
  user: z.object({
    _id: z.string(),
    name: z.string(),
    email: z.string().optional(),
  }).nullable(),
  message: z.string(),
  date: z.string().or(z.date()),
  status: z.enum(["Pending", "Approved", "Rejected"]),
  category: z.enum(["General", "Bug", "Feature Request", "Performance"]),
  responses: z.array(feedbackResponseSchema).optional(),
});

export type Feedback = z.infer<typeof feedbackSchema>;
export type FeedbackResponse = z.infer<typeof feedbackResponseSchema>;

export const parseFeedbackItem = (item: any): Feedback => {
  const baseItem = {
    ...item,
    date: new Date(item.date).toISOString(),
    responses: item.responses?.map((res: any) => ({
      ...res,
      respondedAt: new Date(res.respondedAt).toISOString(),
    })),
  };

  const parsed = feedbackSchema.parse(baseItem);

  return {
    ...parsed,
    user: parsed.user ?? { _id: 'unknown', name: 'Unknown User' },
    responses: parsed.responses?.map(res => ({
      ...res,
      respondedBy: res.respondedBy ?? { _id: 'unknown', name: 'Unknown Admin' }
    }))
  };
};