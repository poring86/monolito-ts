import Id from "../../../../modules/shared/domain/value-object/id.value-object";
import Client from "../../domain/client.entity";
import FindClientUsecase from "./find-client.usecase";

const client = new Client({
  id: new Id("1"),
  name: "Client 1",
  email: "x@x.com",
  document: "client.document",
  street: "client.street",
  number: "client.number",
  complement: "client.complement",
  city: "client.city",
  state: "client.state",
  zipCode: "client.zipCode",
});

const MockRepository = () => {
  return {
    add: jest.fn(),
    find: jest.fn().mockReturnValue(Promise.resolve(client)),
  };
};

describe("Find client usecase unit test", () => {
  it("should find a client", async () => {
    const repository = MockRepository();
    const usecase = new FindClientUsecase(repository);

    const input = {
      id: "1",
    };

    const result = await usecase.execute(input);

    expect(repository.find).toHaveBeenCalled();
    expect(result.id).toEqual(input.id);
    expect(result.name).toEqual(client.name);
    expect(result.email).toEqual(client.email);
    expect(result.street).toEqual(client.street);
    expect(result.createdAt).toEqual(client.createdAt);
    expect(result.updatedAt).toEqual(client.updatedAt);
  });
});
