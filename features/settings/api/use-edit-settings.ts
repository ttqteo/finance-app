import { client } from "@/lib/hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";

type ResponseType = InferResponseType<typeof client.api.settings.$patch>;
type RequestType = InferRequestType<typeof client.api.settings.$patch>["json"];

export const useEditSettings = () => {
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
      toast.success("Save settings success");
    },
    onError: () => {
      toast.error("Failed to save settings");
    },
  });
  return mutation;
};
