import { graphql } from "msw";

export const handlers = [
  // Handles a "Login" mutation
  // graphql.mutation('Login', null),
  // Handles a "GetUserInfo" query
  graphql.query("base", (req, res, ctx) => {
    const { id: baseId } = req.variables;
    console.log("MOCKED API HERE: baseId is", baseId);

    // query DistroSpotsForBaseId($baseId: ID!) {
    //     base(id: $baseId) {
    //       distributions {
    //         distributionSpots {
    //           id
    //           name
    //           latitude
    //           longitude
    //         }
    //       }
    //     }
    //   }

    return res(
      ctx.data({
        base: {
        __typename: "Base",
          distributions: {
            __typename: "Distributions",
            distributionSpots: [
              {
                __typename: "DistributionSpot",
                id: "1",
                name: "Horgos River",
                latitude: 132.142,
                longitude: 132.142,
              },
            ],
          },
        },
      })
    );
  }),
];
