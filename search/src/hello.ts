import moment from "moment";



const buildQuery = (): string => {
    const currentdate = moment().format('YYYY-MM-DD')
    const pastDate = moment().subtract(150, 'days')

    const query = {
        "bool": {
            "filter": [{
                "term": {
                    "channelName.keyword": "siteStatus"
                }
            }, {
                "term": {
                    "status.keyword": "cloudversion"
                }
            }, {
                "range": {
                    "@timestamp": {
                        "gte": pastDate,
                        "lte": currentdate
                    }
                }
            }],
            "must_not": []
        }
    }

    return JSON.stringify(query);
}

const query = buildQuery()

const hello = (name: string) => {

    console.log(new Date());
    console.log(new Date().toLocaleDateString());
    console.log(new Date().toISOString());
    console.log(new Date().toUTCString());
    console.log(moment().format('YYYY-MM-DD'));
    console.log(query);


    console.log(`Hello ${name}`);

}

hello('jay')