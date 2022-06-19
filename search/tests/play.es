
get /_cat/indices 

get /us-east-develop.oncamdev.com-app-2022.06/_mapping

get /snp_financials/_search

get /car/_search 
{
    "query": {
        "bool": {
            "must": [{
                "match_all": {}
            }]
        }
    }
}