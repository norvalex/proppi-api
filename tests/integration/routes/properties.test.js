const request = require("supertest");
const { Property } = require("../../../models/property");
let server;
const endpoint = "/api/properties";
describe(endpoint, () => {
  beforeEach(() => {
    server = require("../../../index");
  });

  afterEach(async () => {
    await server.close();
    await Property.collection.deleteMany({});
  });

  describe("GET /", () => {
    it("should return all non-archived properties", async () => {
      await Property.insertMany([
        {
          erf: "123",
          addressLine1: "addr1",
          addressLine2: "addr2",
          city: "city1",
          purchaseDate: "2020-01-01",
        },
        {
          erf: "456",
          addressLine1: "addr1",
          addressLine2: "addr2",
          city: "city2",
          purchaseDate: "2020-01-01",
          archived: false,
        },
        {
          erf: "789",
          addressLine1: "addr1",
          addressLine2: "addr2",
          city: "city3",
          purchaseDate: "2020-01-01",
          archived: true,
        },
      ]);

      const res = await request(server).get(endpoint);

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);
      expect(res.body.some((g) => g.erf === "123")).toBeTruthy();
      expect(res.body.some((g) => g.erf === "456")).toBeTruthy();
      expect(res.body.some((g) => g.erf === "789")).toBeFalsy();
    });
  });

  describe("GET /:id", () => {
    let property;

    beforeEach(async () => {
      property = new Property({
        erf: "123",
        addressLine1: "addr1",
        addressLine2: "addr2",
        city: "city1",
        purchaseDate: "2020-01-01",
      });
      await property.save();
    });
    // TODO: should return a 404 if id is invalid
    // TODO: should return a 404 if property not found
    it("should return property if id is valid", async () => {
      const res = await request(server).get(`${endpoint}/${property._id}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("_id", property._id.toString());
      expect(res.body).toHaveProperty("erf", property.erf);
      expect(res.body).toHaveProperty("addressLine1", property.addressLine1);
      expect(res.body).toHaveProperty("addressLine2", property.addressLine2);
      expect(res.body).toHaveProperty("city", property.city);
      expect(res.body).toHaveProperty("purchaseDate");
    });
  });

  describe("POST /", () => {
    let property;

    beforeEach(async () => {
      property = new Property({
        erf: "123",
        addressLine1: "addr1",
        addressLine2: "addr2",
        city: "city1",
        purchaseDate: "2020-01-01",
      });
      await property.save();
    });
    // TODO: should return a 404 if id is invalid
    // TODO: should return a 404 if property not found
    it("should return property if id is valid", async () => {
      const res = await request(server).get(`${endpoint}/${property._id}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("_id", property._id.toString());
      expect(res.body).toHaveProperty("erf", property.erf);
      expect(res.body).toHaveProperty("addressLine1", property.addressLine1);
      expect(res.body).toHaveProperty("addressLine2", property.addressLine2);
      expect(res.body).toHaveProperty("city", property.city);
      expect(res.body).toHaveProperty("purchaseDate");
    });
  });

  
});

