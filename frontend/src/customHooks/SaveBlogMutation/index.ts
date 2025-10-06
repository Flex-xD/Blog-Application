// import { QUERY_KEYS } from "@/constants/queryKeys";
// import apiClient from "@/utility/axiosClient";
// import { useQuery, useQueryClient } from "@tanstack/react-query"

// const useSaveBlogMutation = (userId:string) => {
//     const queryClient = useQueryClient();
//     return useQuery({
//         queryKey:QUERY_KEYS.BLOGS.SAVED(userId) , 
//         queryFn:async () => {
//             const response = await apiClient.post()
//         }
//     })
// }