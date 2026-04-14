"use client";
// "use no memo";
import { productDefaultValues } from "@/lib/constants";
import { insertProductSchema, updateProductSchema } from "@/lib/validators";
import { InsertProduct, Product } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Field, FieldError, FieldLabel } from "../ui/field";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import slugify from "slugify";
import { Textarea } from "../ui/textarea";
import { createProduct, updateProduct } from "@/lib/actions/product-actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "../ui/card";
import Image from "next/image";
import { UploadButton } from "@/lib/uploadthing";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";

export default function ProductForm({
  type,
  product,
  productId,
}: {
  type: "Create" | "Update";
  product?: Product;
  productId?: string;
}) {
  const router = useRouter();
  const form = useForm<InsertProduct>({
    resolver: zodResolver(
      type === "Update" ? updateProductSchema : insertProductSchema,
    ),
    defaultValues:
      product && type === "Update" ? product : productDefaultValues,
  });

  async function onSubmit(formData: InsertProduct) {
    if (type === "Create") {
      const res = await createProduct(formData);
      if (!res.success) {
        toast.error(res.message, { className: " !text-red-50 !bg-red-500" });
        return;
      }
      toast.success(res.message);
      router.push("/admin/products");
    }
    if (type === "Update") {
      if (!productId) {
        router.push("/admin/products");
        return;
      }
      const res = await updateProduct({ ...formData, id: productId });
      if (!res.success) {
        toast.error(res.message, { className: " !text-red-50 !bg-red-500" });
        return;
      }
      toast.success(res.message);
      router.push("/admin/products");
    }
  }

  const images = form.watch("images");
  const isFeatured = form.watch("isFeatured");
  const banner = form.watch("banner");

  return (
    <form
      className="space-y-8"
      method="post"
      onSubmit={form.handleSubmit(onSubmit)}
    >
      <div className="flex flex-col md:flex-row gap-5">
        <Controller
          name="name"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel className="w-full">Name</FieldLabel>
              <Input
                placeholder="Enter product name"
                aria-invalid={fieldState.invalid}
                {...field}
              />
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />
        <Controller
          name="slug"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel className="w-full">Slug</FieldLabel>
              <Input
                disabled
                placeholder="Enter slug"
                aria-invalid={fieldState.invalid}
                {...field}
              />
              <div>
                <Button
                  variant="default"
                  size="sm"
                  type="button"
                  className="cursor-pointer px-4 py-1 "
                  onClick={() => {
                    form.setValue(
                      "slug",
                      slugify(form.getValues("name"), { lower: true }),
                    );
                  }}
                >
                  Generate
                </Button>
              </div>
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />
      </div>
      <div className="flex flex-col md:flex-row gap-5">
        <Controller
          name="category"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel className="w-full">Category</FieldLabel>
              <Input
                placeholder="Enter category"
                aria-invalid={fieldState.invalid}
                {...field}
              />
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />
        <Controller
          name="brand"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel className="w-full">Brand</FieldLabel>
              <Input
                placeholder="Enter brand"
                aria-invalid={fieldState.invalid}
                {...field}
              />
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />
      </div>
      <div className="flex flex-col md:flex-row gap-5">
        <Controller
          name="price"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel className="w-full">Price</FieldLabel>
              <Input
                placeholder="Enter product price"
                aria-invalid={fieldState.invalid}
                {...field}
              />
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />
        <Controller
          name="stock"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel className="w-full">Stock</FieldLabel>
              <Input
                placeholder="Enter stock"
                aria-invalid={fieldState.invalid}
                {...field}
              />
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />
      </div>
      <div className="flex flex-col md:flex-row gap-5">
        <Controller
          name="images"
          control={form.control}
          render={({ fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel className="w-full">Images</FieldLabel>
              <Card>
                <CardContent className="space-y-2 mt-2 min-h-48">
                  <div className="flex-start space-x-2">
                    {images.map((image: string) => (
                      <Image
                        key={image}
                        src={image}
                        alt="product image"
                        className="w-20 h-20 object-cover object-center rounded-sm"
                        width={100}
                        height={100}
                      />
                    ))}
                    <UploadButton
                      endpoint="imageUploader"
                      onClientUploadComplete={(res) => {
                        form.setValue("images", [...images, res[0].ufsUrl]);
                      }}
                      onUploadError={(error: Error) => {
                        toast.error(error.message, {
                          className: " !text-red-50 !bg-red-500",
                        });
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />
      </div>
      <div className="flex flex-col md:flex-row gap-5">
        <Controller
          name="isFeatured"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel className="w-full">Featured Product</FieldLabel>
              <Card>
                <CardContent className="space-y-2 mt-2">
                  <div className="flex gap-2">
                    <Checkbox
                      id="isFeatured"
                      checked={!!field.value}
                      onCheckedChange={field.onChange}
                    />
                    <Label htmlFor="isFeatured">Is Featured ?</Label>
                  </div>
                  <div className="flex gap-2">
                    {isFeatured && banner && (
                      <Image
                        src={banner}
                        alt="banner image"
                        className="w-full object-cover object-center rounded-sm"
                        width={1920}
                        height={680}
                      />
                    )}
                    {isFeatured && !banner && (
                      <UploadButton
                        endpoint="imageUploader"
                        onClientUploadComplete={(res) => {
                          form.setValue("banner", res[0].ufsUrl);
                        }}
                        onUploadError={(error: Error) => {
                          toast.error(error.message, {
                            className: " !text-red-50 !bg-red-500",
                          });
                        }}
                      />
                    )}
                  </div>
                </CardContent>
              </Card>
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />
      </div>
      <div className="flex flex-col md:flex-row gap-5">
        <Controller
          name="description"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel className="w-full">Description</FieldLabel>
              <Textarea
                placeholder="Enter product description"
                aria-invalid={fieldState.invalid}
                {...field}
              />
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />
      </div>
      <div>
        <Button
          type="submit"
          size="lg"
          disabled={form.formState.isSubmitting}
          className="cursor-pointer"
        >
          {form.formState.isSubmitting ? "Submitting" : `${type} Product`}
        </Button>
      </div>
    </form>
  );
}
