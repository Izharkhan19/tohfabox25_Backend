import { Response } from "express";

export const handleError = (res: Response, err: any, message: string) => {
    console.error(`${message}:`, err);
    res.status(500).json({ error: message, details: err.message });
};
