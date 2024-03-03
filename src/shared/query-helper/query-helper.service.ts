import { Injectable } from '@nestjs/common';
import * as _ from "lodash";

@Injectable()
export class QueryHelperService {
    queryToInt(query: any) {
        if (!_.isEmpty(query)) {
            const keys = Object.keys(query);
            keys.forEach((key) => {
                if (_.isEmpty(query[key])) {
                    query[key] = undefined;
                } else {
                    const parse = parseInt(query[key]);
                    if (!_.isNaN(parse)) {
                        query[key] = parse;
                    }
                }
            });
        }
        return query;
    }

    queryToBoolean(query: any) {
        if (!_.isEmpty(query)) {
            const keys = Object.keys(query);
            keys.forEach((key) => {
                if (!_.isEmpty(query[key])) {
                    try {
                        query[key] = JSON.parse(query[key]);
                    } catch (e) {
                        query[key] = query[key];
                    }
                }
            });
        }
        return query;
    }

    queryToArray(query: any) {
        let ids = [];

        if (!_.isEmpty(query)) {
            if (!_.isArray(query)) {
                ids = [query]
            }   else {
                ids = query;
            }
        }
        return ids;
    }
}
