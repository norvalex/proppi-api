const request = require("supertest");
const { Property } = require("../../../models/property");
const { User } = require("../../../models/user");
const { mongoose } = require("mongoose");
const moment = require("moment");
const { Rental } = require("../../../models/rental");

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
        city: "city1",
        purchaseDate: "2020-01-01",
      });
      await property.save();
    });

    it("should return a 404 if id is invalid", async () => {
      const res = await request(server).get(`${endpoint}/1`);

      expect(res.status).toBe(404);
    });

    it("should return a 404 if id is valid but not found", async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(server).get(`${endpoint}/${fakeId}`);

      expect(res.status).toBe(404);
    });

    it("should return the property if id is valid", async () => {
      const res = await request(server).get(`${endpoint}/${property._id}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("_id", property._id.toString());
      expect(res.body).toHaveProperty("erf", property.erf);
      expect(res.body).toHaveProperty("addressLine1", property.addressLine1);
      expect(res.body).toHaveProperty("city", property.city);
      expect(res.body).toHaveProperty("purchaseDate");
    });
  });

  describe("GET /:id/rentals", () => {
    let property;

    beforeEach(async () => {
      property = new Property({
        erf: "123",
        addressLine1: "addr1",
        city: "city1",
        purchaseDate: "2020-01-01",
      });
      await property.save();
    });

    it("should return a 404 if id is invalid", async () => {
      const res = await request(server).get(`${endpoint}/1/rentals`);

      expect(res.status).toBe(404);
    });

    it("should return a 404 if id is valid but not found", async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(server).get(`${endpoint}/${fakeId}/rentals`);

      expect(res.status).toBe(404);
    });

    it("should return the rentals of the property if id is valid", async () => {
      const rental = new Rental({
        property: { _id: property._id },
        agent: { _id: new mongoose.Types.ObjectId() },
        tenant: { _id: new mongoose.Types.ObjectId() },
        startDate: "2022-01-01",
        endDate: "2022-12-31",
        monthlyRentalAmount: "1",
      });
      await rental.save();
      const res = await request(server).get(
        `${endpoint}/${property._id}/rentals`
      );

      expect(res.status).toBe(200);
      expect(res.body[0]).toHaveProperty(
        "property._id",
        property._id.toString()
      );
    });
  });

  describe("POST /", () => {
    let token;
    let payload;

    function exec() {
      return request(server)
        .post(endpoint)
        .set("x-auth-token", token)
        .send(payload);
    }

    beforeEach(async () => {
      token = User().generateAuthToken();
      payload = {
        erf: "123",
        addressLine1: "addr1",
        city: "city1",
        purchaseDate: "2020-01-01",
      };
    });

    it("should return a 401 id user not logged in", async () => {
      token = "";
      const res = await exec();

      expect(res.status).toBe(401);
    });

    describe("payload.erf", () => {
      it("should return a 400 if erf not provided", async () => {
        delete payload.erf;

        const res = await exec();

        expect(res.status).toBe(400);
      });

      it("should return a 400 if erf is less than 1 char(s)", async () => {
        payload.erf = "";

        const res = await exec();

        expect(res.status).toBe(400);
      });

      it("should return a 400 if erf is greater than 10 chars", async () => {
        payload.erf = new Array(12).join("a");

        const res = await exec();

        expect(res.status).toBe(400);
      });
    });

    describe("payload.addressLine1", () => {
      it("should return a 400 if addressLine1 is not provided", async () => {
        delete payload.addressLine1;

        const res = await exec();

        expect(res.status).toBe(400);
      });

      it("should return a 400 if addressLine1 is less than 5 char(s)", async () => {
        payload.addressLine1 = "abcd";

        const res = await exec();

        expect(res.status).toBe(400);
      });

      it("should return a 400 if addressLine1 is greater than 255 chars", async () => {
        payload.addressLine1 = new Array(257).join("a");

        const res = await exec();

        expect(res.status).toBe(400);
      });
    });

    describe("payload.addressLine2", () => {
      it("should return a 400 if addressLine2 is greater than 255 chars", async () => {
        payload.addressLine2 = new Array(257).join("a");

        const res = await exec();

        expect(res.status).toBe(400);
      });
    });

    describe("payload.city", () => {
      it("should return a 400 if city is not provided", async () => {
        delete payload.city;

        const res = await exec();

        expect(res.status).toBe(400);
      });

      it("should return a 400 if city is less than 5 char(s)", async () => {
        payload.city = "abcd";

        const res = await exec();

        expect(res.status).toBe(400);
      });

      it("should return a 400 if city is greater than 255 chars", async () => {
        payload.city = new Array(257).join("a");

        const res = await exec();

        expect(res.status).toBe(400);
      });
    });

    describe("payload.purchaseDate", () => {
      it("should return a 400 if purchaseDate is not provided", async () => {
        delete payload.purchaseDate;

        const res = await exec();

        expect(res.status).toBe(400);
      });

      it("should return a 400 if purchaseDate is in wrong format", async () => {
        payload.purchaseDate = "23-06-2021";

        const res = await exec();

        expect(res.status).toBe(400);
      });

      it("should return a 400 if purchaseDate is an invalid date", async () => {
        // TODO: date validation not great - as '2021-06-31' passed..
        // so suspect only tests if day is less than 31, no matter what month
        payload.purchaseDate = "2021-06-32";

        const res = await exec();

        expect(res.status).toBe(400);
      });
    });

    describe("payload.purchasePrice", () => {
      it("should return a 400 if purchasePrice is less than 0", async () => {
        payload.purchasePrice = -1;

        const res = await exec();

        expect(res.status).toBe(400);
      });
    });

    describe("payload.purchaseFees", () => {
      it("should return a 400 if purchaseFees is less than 0", async () => {
        payload.purchaseFees = -1;

        const res = await exec();

        expect(res.status).toBe(400);
      });
    });

    describe("payload.salesDate", () => {
      it("should return a 400 if salesDate is posted", async () => {
        payload.salesDate = "2023-06-02";

        const res = await exec();

        expect(res.status).toBe(400);
      });
    });

    describe("payload.salesPrice", () => {
      it("should return a 400 if salesPrice is posted", async () => {
        payload.salesPrice = 1;

        const res = await exec();

        expect(res.status).toBe(400);
      });
    });

    describe("payload.salesFees", () => {
      it("should return a 400 if salesFees is posted", async () => {
        payload.salesFees = 1;

        const res = await exec();

        expect(res.status).toBe(400);
      });
    });

    it("should save the property if it is valid", async () => {
      await exec();

      const propertyInDb = await Property.findOne({ erf: "123" });

      expect(propertyInDb).not.toBeNull();
    });

    it("should return property if it is valid", async () => {
      const res = await exec();

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("_id");
      expect(res.body).toHaveProperty("erf", "123");
      expect(res.body).toHaveProperty("addressLine1", "addr1");
      expect(res.body).toHaveProperty("city", "city1");
      expect(res.body).toHaveProperty("purchaseDate");
    });
  });

  describe("PUT /", () => {
    let token;
    let payload;
    let property;
    let propertyId;

    function exec() {
      return request(server)
        .put(`${endpoint}/${propertyId}`)
        .set("x-auth-token", token)
        .send(payload);
    }

    beforeEach(async () => {
      property = new Property({
        erf: "123",
        addressLine1: "addr1",
        city: "city1",
        purchaseDate: "2020-01-01",
      });
      await property.save();
      propertyId = property._id;

      token = User().generateAuthToken();
      payload = {
        erf: "1234",
        addressLine1: "addr2",
        city: "city2",
        purchaseDate: "2020-01-02",
      };
    });

    it("should return a 401 id user not logged in", async () => {
      token = "";
      const res = await exec();

      expect(res.status).toBe(401);
    });

    it("should return a 404 if id is invalid", async () => {
      propertyId = 1;

      const res = await exec();

      expect(res.status).toBe(404);
    });

    it("should return a 404 if id is valid but not found", async () => {
      propertyId = new mongoose.Types.ObjectId();

      const res = await exec();

      expect(res.status).toBe(404);
    });

    describe("payload.erf", () => {
      it("should return a 400 if erf not provided", async () => {
        delete payload.erf;

        const res = await exec();

        expect(res.status).toBe(400);
      });

      it("should return a 400 if erf is less than 1 char(s)", async () => {
        payload.erf = "";

        const res = await exec();

        expect(res.status).toBe(400);
      });

      it("should return a 400 if erf is greater than 10 chars", async () => {
        payload.erf = new Array(12).join("a");

        const res = await exec();

        expect(res.status).toBe(400);
      });
    });

    describe("payload.addressLine1", () => {
      it("should return a 400 if addressLine1 is not provided", async () => {
        delete payload.addressLine1;

        const res = await exec();

        expect(res.status).toBe(400);
      });

      it("should return a 400 if addressLine1 is less than 5 char(s)", async () => {
        payload.addressLine1 = "abcd";

        const res = await exec();

        expect(res.status).toBe(400);
      });

      it("should return a 400 if addressLine1 is greater than 255 chars", async () => {
        payload.addressLine1 = new Array(257).join("a");

        const res = await exec();

        expect(res.status).toBe(400);
      });
    });

    describe("payload.addressLine2", () => {
      it("should return a 400 if addressLine2 is greater than 255 chars", async () => {
        payload.addressLine2 = new Array(257).join("a");

        const res = await exec();

        expect(res.status).toBe(400);
      });
    });

    describe("payload.city", () => {
      it("should return a 400 if city is not provided", async () => {
        delete payload.city;

        const res = await exec();

        expect(res.status).toBe(400);
      });

      it("should return a 400 if city is less than 5 char(s)", async () => {
        payload.city = "abcd";

        const res = await exec();

        expect(res.status).toBe(400);
      });

      it("should return a 400 if city is greater than 255 chars", async () => {
        payload.city = new Array(257).join("a");

        const res = await exec();

        expect(res.status).toBe(400);
      });
    });

    describe("payload.purchaseDate", () => {
      it("should return a 400 if purchaseDate is not provided", async () => {
        delete payload.purchaseDate;

        const res = await exec();

        expect(res.status).toBe(400);
      });

      it("should return a 400 if purchaseDate is in wrong format", async () => {
        payload.purchaseDate = "23-06-2021";

        const res = await exec();

        expect(res.status).toBe(400);
      });

      it("should return a 400 if purchaseDate is an invalid date", async () => {
        // TODO: date validation not great - as '2021-06-31' passed..
        // so suspect only tests if day is less than 31, no matter what month
        payload.purchaseDate = "2021-06-32";

        const res = await exec();

        expect(res.status).toBe(400);
      });
    });

    describe("payload.purchasePrice", () => {
      it("should return a 400 if purchasePrice is less than 0", async () => {
        payload.purchasePrice = -1;

        const res = await exec();

        expect(res.status).toBe(400);
      });
    });

    describe("payload.purchaseFees", () => {
      it("should return a 400 if purchaseFees is less than 0", async () => {
        payload.purchaseFees = -1;

        const res = await exec();

        expect(res.status).toBe(400);
      });
    });

    describe("payload.salesDate", () => {
      it("should return a 400 if salesDate is in wrong format", async () => {
        payload.salesDate = "23-06-2021";

        const res = await exec();

        expect(res.status).toBe(400);
      });

      it("should return a 400 if salesDate is an invalid date", async () => {
        // TODO: date validation not great - as '2021-06-31' passed..
        // so suspect only tests if day is less than 31, no matter what month
        payload.salesDate = "2021-06-32";

        const res = await exec();

        expect(res.status).toBe(400);
      });

      it("should return a 400 if salesDate is before purchaseDate", async () => {
        payload.salesDate = moment(payload.purchaseDate).subtract(1, "days");

        const res = await exec();

        expect(res.status).toBe(400);
      });
    });

    describe("payload.salesPrice", () => {
      it("should return a 400 if salesPrice is less than 0", async () => {
        payload.salesPrice = -1;

        const res = await exec();

        expect(res.status).toBe(400);
      });
    });

    describe("payload.salesFees", () => {
      it("should return a 400 if salesFees is less than 0", async () => {
        payload.purchaseFees = -1;

        const res = await exec();

        expect(res.status).toBe(400);
      });
    });

    it("should save the property if it is valid", async () => {
      await exec();

      const propertyInDb = await Property.findOne({ erf: "1234" });

      expect(propertyInDb).not.toBeNull();
    });

    it("should return property if it is valid", async () => {
      const res = await exec();

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("_id", property._id.toHexString());
      expect(res.body).toHaveProperty("erf", payload.erf);
      expect(res.body).toHaveProperty("addressLine1", payload.addressLine1);
      expect(res.body).toHaveProperty("city", payload.city);
      expect(res.body).toHaveProperty("purchaseDate");
    });
  });

  describe("DELETE /", () => {
    // TODO
    let property;
    let token;
    let propertyId;

    function exec() {
      return request(server)
        .delete(`${endpoint}/${propertyId}`)
        .set("x-auth-token", token);
    }

    beforeEach(async () => {
      property = new Property({
        erf: "123",
        addressLine1: "addr1",
        city: "city1",
        purchaseDate: "2020-01-01",
      });
      await property.save();

      propertyId = property._id;
      token = User({
        _id: new mongoose.Types.ObjectId(),
        isAdmin: true,
      }).generateAuthToken();
    });

    it("should return a status of 401 if user not logged in", async () => {
      token = "";
      const res = await exec();
      expect(res.status).toBe(401);
    });

    it("should return a status of 403 if user logged in but not admin", async () => {
      token = User({
        _id: new mongoose.Types.ObjectId(),
        isAdmin: false,
      }).generateAuthToken();

      const res = await exec();

      expect(res.status).toBe(403);
    });

    it("should return a status of 404 if id is not valid", async () => {
      propertyId = 1;

      const res = await exec();

      expect(res.status).toBe(404);
    });

    it("should return a status of 404 if id is valid but not found", async () => {
      propertyId = new mongoose.Types.ObjectId();

      const res = await exec();

      expect(res.status).toBe(404);
    });

    it("should delete (archive) property from db", async () => {
      await exec();

      const res = await Property.findOne({ erf: property.erf });

      expect(res).toHaveProperty("archived", true);
    });

    it("should return property if deleted (archived)", async () => {
      const res = await exec();

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("_id", property._id.toHexString());
      expect(res.body).toHaveProperty("erf", property.erf);
      expect(res.body).toHaveProperty("addressLine1", property.addressLine1);
      expect(res.body).toHaveProperty("city", property.city);
      expect(res.body).toHaveProperty("purchaseDate");
      expect(res.body).toHaveProperty("archived", true);
    });
  });
});
