import ApiClient from "./services/api/client";

const config = {
  baseURL: "http://localhost:1139",
  clientKey: "123",
  sourceKey: "123",
};

const api = ApiClient.initialize(config);
api.getAnnotations("75059577", true).then(async (annotations) => {
  console.log(annotations);

  const someAnnotation = annotations.find((a) => a.attribute === "registerLink");
  console.log("someAnnotation", someAnnotation);

  // try to delete the annotation
  someAnnotation?.archive().then(() => {
    // try to restore the annotation
    someAnnotation?.restore();
  });
});

api
  .createAnnotation("123", {
    projectKey: "1",
    nodeId: "1",
    dataSource: "test",
    entity: "test",
    attribute: "test",
    dataType: "test",
    value: "test",
  })
  .then((annotation) => {
    console.log(annotation);
  });
