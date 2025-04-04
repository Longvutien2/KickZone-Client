import axios from "axios";

export const getAddress = () => {
    return axios.get("/data/data.json").then((res) => res.data);
};