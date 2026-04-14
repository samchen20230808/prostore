"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  createUpdateReview,
  getReviewsByProductId,
} from "@/lib/actions/review-actions";
import { reviewFormDefaultValues } from "@/lib/constants";
import { insertReviewSchema } from "@/lib/validators";
import { InsertReview } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { StarIcon } from "lucide-react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

export default function ReviewForm({
  userId,
  productId,
  onReviewSubmitted,
}: {
  userId: string;
  productId: string;
  onReviewSubmitted: () => void;
}) {
  const [open, setOpen] = useState(false);
  const form = useForm<InsertReview>({
    resolver: zodResolver(insertReviewSchema),
    defaultValues: {
      ...reviewFormDefaultValues,
      userId,
      productId,
    },
  });

  async function handleOpenChange(newOpen: boolean) {
    setOpen(newOpen);

    if (newOpen) {
      const review = await getReviewsByProductId({ productId });
      if (review) {
        form.reset({
          ...reviewFormDefaultValues,
          userId,
          productId,
          title: review.title,
          description: review.description,
          rating: review.rating,
        });
      }
    } else {
      form.reset(reviewFormDefaultValues);
    }
  }

  async function onSubmit(formData: InsertReview) {
    console.log(formData);
    const res = await createUpdateReview({ ...formData, userId, productId });
    if (!res.success) {
      toast.error(res.message, { className: " !text-red-50 !bg-red-500" });
      return;
    }

    setOpen(false);
    form.reset();

    onReviewSubmitted();
    toast.success(res.message);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button variant="default" className="mt-2">
            {`${form.getValues("title") ? "Update" : "Write"} a Review`}
          </Button>
        }
      />
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Write a Review</DialogTitle>
          <DialogDescription>
            Share your thoughts with other customers
          </DialogDescription>
        </DialogHeader>
        <form method="post" onSubmit={form.handleSubmit(onSubmit)}>
          {/* <input name="userId" defaultValue={userId} hidden />
          <input name="productId" defaultValue={productId} hidden /> */}
          <div className="grid gap-4 py-4">
            <Controller
              name="title"
              control={form.control}
              render={({ field, fieldState }) => (
                <div className="flex flex-col md:flex-row gap-5">
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel className="w-full">Title</FieldLabel>
                    <Input
                      placeholder="Enter title"
                      aria-invalid={fieldState.invalid}
                      {...field}
                    />
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                </div>
              )}
            />
            <Controller
              name="description"
              control={form.control}
              render={({ field, fieldState }) => (
                <div className="flex flex-col md:flex-row gap-5">
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel className="w-full">Description</FieldLabel>
                    <Textarea
                      placeholder="Enter description"
                      aria-invalid={fieldState.invalid}
                      {...field}
                    />
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                </div>
              )}
            />
            <Controller
              name="rating"
              control={form.control}
              render={({ field, fieldState }) => (
                <div className="flex flex-col md:flex-row gap-5">
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel className="w-full">Rating</FieldLabel>

                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue>
                          {field.value ? (
                            <span className="flex items-center">
                              {field.value}
                              <StarIcon className="ml-1 h-4 w-4" />
                            </span>
                          ) : (
                            "Select a rating"
                          )}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5].map((rating) => (
                          <SelectItem key={rating} value={rating.toString()}>
                            {rating}
                            <StarIcon className="inline h-4 w-4" />
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <FieldError errors={[fieldState.error]} />
                  </Field>
                </div>
              )}
            />
          </div>
          <DialogFooter>
            <DialogClose render={<Button variant="outline">Cancel</Button>} />
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Submitting..." : "Submit"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
