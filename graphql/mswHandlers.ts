import { HttpResponse } from 'msw'
import { mockActionOptionsForBoxesViewQuery, mockAllOrganisationsAndBasesQuery, mockBoxesForBoxesViewQuery, mockOrganisationAndBasesQuery, ShipmentState } from './generated/types';
import { aBase, aBox, aBoxPage, anOrganisation, aPageInfo, aShipment } from './generated/mocks';

/**
 * TODO: 
 * - auth0 mock/bypass
 * - playwright
 * - 1 working test
 * - msw handlers
 * - fixtures
 * - error handling
 * - ci
 * - full migration
 */

export const mockAllOrganisationsAndBasesQueryHandler = mockAllOrganisationsAndBasesQuery(() => {
  // const { baseId } = variables;

  // if ((baseId as string).includes("withError"))
  //   return HttpResponse.json({
  //     errors: [
  //       { message: "error" }
  //     ]
  //   })

  return HttpResponse.json({
    data: {
      __typename: 'Query',
      organisations: [anOrganisation()]
    }
  })
});

export const mockOrganisationsAndBasesQueryHandler = mockOrganisationAndBasesQuery(() => {
  return HttpResponse.json({
    data: {
      __typename: 'Query',
      bases: [aBase({ id: "2" }), aBase({ id: "3" })]
    }
  })
});

export const mockBoxesForBoxesViewHandler = mockBoxesForBoxesViewQuery(() => {
  return HttpResponse.json({
    data: {
      __typename: 'Query',
      boxes: aBoxPage({
        elements: [aBox({ id: "2" })],
        totalCount: 1,
        pageInfo: aPageInfo()
      })
    }
  })
});

export const mockActionOptionsForBoxesViewHandler = mockActionOptionsForBoxesViewQuery(() => {
  return HttpResponse.json({
    data: {
      __typename: 'Query',
      base: aBase({ id: "2" }),
      shipments: [aShipment({ sourceBase: aBase({ id: "2" }), targetBase: aBase({ id: "2" }), state: ShipmentState.Preparing })]
    }
  })
});