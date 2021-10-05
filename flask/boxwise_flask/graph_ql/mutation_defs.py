"""GraphQL mutation definitions"""
from ariadne import gql

mutation_defs = gql(
    """
    type Mutation {
        createBox(boxCreationInput: CreateBoxInput): Box
        updateBox(boxUpdateInput: UpdateBoxInput): Box
        createBeneficiary(beneficiaryCreationInput: CreateBeneficiaryInput): Beneficiary
        updateBeneficiary(beneficiaryUpdateInput: UpdateBeneficiaryInput): Beneficiary
    }
    """
)
