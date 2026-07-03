import { graphql } from "../../../graphql/graphql";
import { TAG_FRAGMENT } from "./fragments";

export const BENEFICIARY_FIGURES_QUERY = graphql(`
  query BeneficiaryFigures($baseId: ID!) {
    beneficiaryFigures(baseId: $baseId) {
      majorFamilyHeadGender
      majorFamilyHeadGenderPercentage
      averageFamilySize
      averageItemsPerVisitPerBeneficiary
      averageTotalItemsPerBeneficiary
      newRegistrationsLast30Days
      percentageWithoutFreeshopVisitLast90Days
    }
  }
`);

export const BENEFICIARY_REACH_QUERY = graphql(`
  query BeneficiaryReach($baseId: Int!) {
    beneficiaryReach(baseId: $baseId) {
      facts {
        reachedOn
        beneficiaryId
        reachType
        count
      }
      dimensions {
        beneficiary {
          id
          age
          gender
          tagIds
        }
      }
    }
  }
`);

export const CREATED_BOXES_QUERY = graphql(`
  query createdBoxes($baseId: Int!) {
    createdBoxes(baseId: $baseId) {
      facts {
        boxesCount
        productId
        categoryId
        createdOn
        tagIds
        gender
        itemsCount
      }
      dimensions {
        product {
          id
          name
          gender
        }
        category {
          id
          name
        }
        tag {
          id
          name
          color
        }
      }
    }
  }
`);

export const STOCK_QUERY = graphql(
  `
    query stockOverview($baseId: Int!) {
      stockOverview(baseId: $baseId) {
        facts {
          productName
          categoryId
          gender
          boxesCount
          itemsCount
          sizeId
          tagIds
          boxState
          locationId
        }
        dimensions {
          category {
            id
            name
          }
          size {
            id
            name
          }
          tag {
            ...TagFragment
          }
          location {
            id
            name
          }
        }
      }
    }
  `,
  [TAG_FRAGMENT],
);

export const MOVED_BOXES_QUERY = graphql(`
  query movedBoxes($baseId: Int!) {
    movedBoxes(baseId: $baseId) {
      facts {
        movedOn
        targetId
        categoryId
        sizeId
        boxesCount
        itemsCount
        gender
        productName
        tagIds
        organisationName
      }
      dimensions {
        category {
          id
          name
        }
        size {
          id
          name
        }
        target {
          id
          name
          type
        }
      }
    }
  }
`);

export const DEMOGRAPHIC_QUERY = graphql(`
  query BeneficiaryDemographics($baseId: Int!) {
    beneficiaryDemographics(baseId: $baseId) {
      facts {
        count
        createdOn
        age
        gender
        tagIds
      }
      dimensions {
        tag {
          id
          name
          color
        }
      }
    }
  }
`);

export const DASHBOARD_INFO_QUERY = graphql(`
  query dashboardInfo {
    bases {
      id
      name
      locations {
        id
      }
      instockBoxesCount
      instockItemsCount
    }
  }
`);

export const DASHBOARD_FILTER_DATA_QUERY = graphql(`
  query DashboardFilterData($baseId: ID!) {
    base(id: $baseId) {
      products {
        id
        name
        gender
        category {
          id
          name
        }
      }
      locations {
        id
        name
      }
      tags {
        id
        name
        color
      }
    }
  }
`);
