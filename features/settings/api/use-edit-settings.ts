import { client } from "@/lib/hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

type ResponseType = InferResponseType<typeof client.api.settings.$patch>;
type RequestType = InferRequestType<typeof client.api.settings.$patch>["json"];

export const useEditSettings = () => {
  const t = useTranslations();
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      const response = await client.api.settings.$patch({
        json,
      });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      toast.success(t("Toast.Success"));
    },
    onError: () => {
      toast.error(t("Toast.Failure"));
    },
  });
  return mutation;
};
