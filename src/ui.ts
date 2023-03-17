//ui code
console.log("hello world")

import ApiClient from "./services/api/client"
const api = ApiClient()

api.connect("http://localhost:1139", "123", "123")
api.searchAnnotations("75059577").then((res) => console.log(res))
