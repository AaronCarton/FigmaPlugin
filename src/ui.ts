import Annotation from "./interfaces/interface.annotation";
import ApiClient from "./services/api/client";

const api = ApiClient.initialize("http://localhost:1139", "123", "123");
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
    deleted: true,
  })
  .then((annotation) => {
    console.log(annotation);
  });
