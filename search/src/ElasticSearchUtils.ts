import { Client } from "@elastic/elasticsearch";
import { CreateRequest, CreateResponse, SearchRequest, SearchResponse } from "@elastic/elasticsearch/lib/api/types";
import { v4 as uuidv4 } from 'uuid';

export class ElasticSearchUtils {

    constructor(private client: Client) { }


    create = (index: string, document: string): Promise<CreateResponse> => {
        const createRequest: CreateRequest = {
            id: uuidv4(),
            index,
            document
        }
        return this.client.create(createRequest)
    }


    search = async (index: string, query: Object): Promise<SearchResponse> => {
        const searchRequest: SearchRequest = {
            index,
            query
        }

        const result = await this.client.search(searchRequest)
        return result
    }

}