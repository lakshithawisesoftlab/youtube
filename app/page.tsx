"use client";

import { useState } from "react";

import Link from "next/link";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ClipboardCopy, Loader2 } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  url: z
    .string({
      required_error: "Please enter a URL",
    })
    .url({
      message: "Please enter a valid URL",
    }),
});

const Page = () => {
  const [urlId, setUrlId] = useState<string>("" as string);

  const domain = typeof window !== "undefined" && window.location.origin;

  const generatedURL = `${domain}/${urlId}`;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    if (data.url.split(".")[1] !== "youtube") {
      toast.error("Please enter a valid youtube URL");

      return;
    }

    const res = await axios.post("/api/generate-url", data);

    if (res.data.status === "200") {
      toast.success(res.data.message);
      setUrlId(res.data.data.id);
    } else {
      toast.error(res.data.message);
    }
  };

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center gap-5">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-row gap-2.5 justify-center"
        >
          <FormField
            control={form.control}
            name="url"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    placeholder="Url"
                    {...field}
                    className={
                      form.formState.errors.url && "border-red-500 outline-none"
                    }
                  />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            disabled={form.formState.isSubmitting}
            className="w-24"
          >
            {form.formState.isSubmitting ? (
              <Loader2 className="size-6 animate-spin" />
            ) : (
              "Generate"
            )}
          </Button>
        </form>
      </Form>
      <div>
        {urlId && (
          <div className=" p-1 px-4 ml-4 rounded-md flex items-center justify-center">
            <Link href={generatedURL} target="_blank" rel="noreferrer">
              {generatedURL}
            </Link>
            <button
              id="copyUrl"
              className=""
              onClick={() => {
                navigator.clipboard.writeText(generatedURL);
                toast.success("Copied to clipboard");
              }}
            >
              <ClipboardCopy
                className={cn(
                  "h-6 text-[#424242] cursor-pointer ml-2 opacity-100)"
                )}
              />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Page;
