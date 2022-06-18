
get /_cat/indices 



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