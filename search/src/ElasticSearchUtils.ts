import { Client } from "@elastic/elasticsearch";
import { CreateRequest, CreateResponse, ExistsRequest, IndexRequest, IndicesCreateRequest, SearchRequest, SearchResponse } from "@elastic/elasticsearch/lib/api/types";
import { v4 as uuidv4 } from 'uuid';

export class ElasticSearchUtils {

    constructor(private client: Client) { }

    isExists = async (index: string, id: string): Promise<boolean> => {
        const existsRequest: ExistsRequest = {
            index,
            id
        }
        return await this.client.exists(existsRequest);
    }


    createIndex = (index: string): Promise<any> => {
        const indicesCreateRequest: IndicesCreateRequest = {
            index,
        }
        return this.client.indices.create(indicesCreateRequest)
    }


    addOrupdate = (index: string, id: string | null, document: string): Promise<any> => {
        const createRequest: IndexRequest = {
            index,
            id: id ? id : uuidv4(),
            document
        }
        return this.client.index(createRequest)
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