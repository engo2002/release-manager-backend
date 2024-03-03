import { ArgumentsHost, Catch } from "@nestjs/common";
import { BaseExceptionFilter } from "@nestjs/core";
import { Request, Response } from "express";
import { QueryFailedError } from "typeorm";
@Catch(QueryFailedError)
export class QueryErrorFilter extends BaseExceptionFilter {
    public catch(exception: any, host: ArgumentsHost): any {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();
        const detail = exception.sqlMessage.toLowerCase();
        if (typeof detail === "string" && detail.includes("duplicate entry")) {
            const regex = /for key '(.*?)'/;
            const matches = detail.match(regex);

            const duplicateField: string = matches && matches.length > 1 ? matches[1] : "unknown field";

            response.status(400).send({
                statusCode: 400,
                timestamp: new Date().toISOString(),
                path: request.url,
                message: `Entry with duplicate value in field: ${duplicateField}`,
            });
            return;
        }
        response.status(400).send({
            statusCode: 400,
            timestamp: new Date().toISOString(),
            path: request.url,
            message: "SQL Error: " + detail,
        });
    }
}
