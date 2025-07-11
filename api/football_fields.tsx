/* eslint-disable @typescript-eslint/no-explicit-any */
import { FootballField } from "@/models/football_field";
import { API_NodeJS } from "./utils/axios";

// Đăng ký sân bóng mới
export const createFootballField = (field: FootballField) => {
  return API_NodeJS.post("footballField", field);
};

export const updateFootballField = (id: string, field: FootballField) => {
  return API_NodeJS.patch(`footballField/${id}`, field);
};

// Lấy danh sách sân bóng
export const getFootballField = () => {
  return API_NodeJS.get<FootballField[]>("footballField");
};

export const getFootballFieldAddress = () => {
  return API_NodeJS.get<FootballField[]>("footballField/address/field");
};

// Lấy danh sách sân bóng theo user
export const getFootballFieldByIdUser = (id: string) => {
  return API_NodeJS.get<FootballField>(`footballField/${id}/user`);
};

export const getFootballFieldByStatus = (status: string) => {
  return API_NodeJS.get<FootballField[]>(`footballField/${status}/status`);
};

export const getFootballFieldById = (id: string) => {
  return API_NodeJS.get<FootballField>(`footballField/${id}`);
};

