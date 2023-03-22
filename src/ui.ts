import ApiClient from "./services/api/client";
const api = ApiClient();

api.connect("http://localhost:1139", "123", "123");
api.searchAnnotations("75059577").then((res) => {
  const annotations = res.results.map((r) => r.item);
  const someAnnotation = annotations.find((a) => a.attribute === "passwordField")!;

  api.deleteAnnotation(someAnnotation).then((res) => {
    console.log(res);
  });
});
