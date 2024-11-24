import { AxiosAdapter } from "../Adapters/axios.adapter";

export const backpackDBFetcher = new AxiosAdapter({
    baseUrl: "http://192.168.0.6:5232/api", //
    params: {}
});
