import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { CreateListingDto } from '../src/modules/listing/dto/create-listing.dto';
import { INestApplication } from '@nestjs/common';

const listings: CreateListingDto[] = [
  {
    name: "Kuca1",
    category: "Kuca",
    description: "Fino",
    address: "Tamo",
    addressTags: ["weekend", "summer"],
    price: 100,
    beds: 2,
    guests: 5,
    lat: 21,
    lng: 21,
    amenities: ["a", "b"]
  },

  {
    name: "Kuca2",
    category: "Kuca",
    description: "Fino",
    address: "Tamo2",
    addressTags: ["weekend", "summer"],
    price: 500,
    beds: 3,
    guests: 6,
    lat: 22,
    lng: 22,
    amenities: ["a", "b"]
  },

{
    name: "Stan1",
    category: "Stan",
    description: "Fino",
    address: "Zgrada1",
    addressTags: ["weekend", "summer"],
    price: 100,
    beds: 1,
    guests: 2,
    lat: 24,
    lng: 24,
    amenities: ["a", "b"]
  },
];

let newListing = {
    name: "Stan3",
    category: "Stan",
    description: "Fino",
    address: "Zgrada2",
    addressTags: ["weekend", "summer"],
    price: 220,
    beds: 1,
    guests: 2,
    lat: 25,
    lng: 25,
    amenities: ["a", "b"]
}

const gql = '/graphql';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe(gql, () => {
    describe('listings', () => {
      it('return list of listing objects', () => {
        return request(app.getHttpServer())
          .post(gql)
          .send({ query: `{Listings {
                              id
                              name
                              category 
                              price
                              beds
                              }}` })
          .expect(200)
          .expect((res) => {
            expect(res.body.data.Listings).toEqual(listings);
          });
      });
      describe('one listing', () => {
        it('should get a single listing', () => {
          return request(app.getHttpServer())
            .post(gql)
            .send({ query: '{listing (Id:{id:"1"}){id name category price}}' })
            .expect(200)
            .expect((res) => {
              expect(res.body.data.getListing).toEqual({
                id: 1,
                name: "Kuca1",
                category: "Kuca",
                price: 100,
              });
            });
        });
        it('should get an error for bad id', () => {
          return request(app.getHttpServer())
            .post(gql)
            .send({ query: '{getListing(Id: {id:"500"}){name category price}}' })
            .expect(200)
            .expect((res) => {
              expect(res.body.data).toBe(null);
              expect(res.body.errors[0].message).toBe(
                'No listing found with id 500 found',
              );
            });
        });
      });
      it('should create a new listing and have it added to the array', () => {
        return (
          request(app.getHttpServer())
            .post(gql)
            .send({
              query:
                'mutation {createListing(input: { name: "Stan3", category: "Stan", price: 220 }) {name category price}}',
            })
            .expect(200)
            .expect((res) => {
              expect(res.body.data.createListing).toEqual(newListing);
            })
            // chain another request to see our original one works as expected
            .then(() =>
              request(app.getHttpServer())
                .post(gql)
                .send({ query: '{getListings {id name breed age}}' })
                .expect(200)
                .expect((res) => {
                  expect(res.body.data.getListings).toEqual(
                    listings.concat([newListing]),
                  );
                }),
            )
        );
      });
    });
  });
});