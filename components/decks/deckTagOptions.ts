export interface ItemProps {
    label: string
    value: string
}
enum DHSPrograms {
    SNAP = 'SNAP',
    TANF = 'TANF',
    ERDC = 'ERDC',
    MSP = 'MSP',
    MAGI = 'MAGI',
    NON_MAGI = 'NON-MAGI',
    TA_DVS = 'TA-DVS',
    LTC = 'LTC',
}
enum AdditionalTags {
    COMMUNITY_RESOURCES = 'COMMUNITY RESOURCES',
    ICT = 'ICT',
    SSA = 'SSA',
    ABAWD = 'ABAWD',
    IEVS = 'IEVS',
    MEDICARE = 'MEDICARE',
    RA = 'RA',
    ANNUITY = 'ANNUITY',
    AVS = 'AVS',
    LIFE_INSURANCE = 'LIFE INSURANCE',
    MEDICAL_EXPENSES = 'MEDICAL EXPENSES',
    TRUSTS = 'TRUSTS',
    MRP = 'MEDICAL RELATED PAYMENT',
    ICP = 'INDEPENDENT CHOICES PROGRAM',
    I_DD = 'I/DD',
    BEHAVIORAL_HEALTH = 'BEHAVIORAL HEALTH / 1915i',
    HEARINGS = 'HEARINGS',
}
enum Teams {
    ADMIN = 'ADMIN',
    ELIGIBILITY = 'ELIGIBILITY',
    CM = 'CASE MANAGER',
}

export const deckTags = Object.values(DHSPrograms)
    .map(value => ({ label: value, value }))
    .concat(
        // @ts-ignore
        Object.values(AdditionalTags).map(value => ({ label: value, value }))
    )
    .concat(
        //@ts-ignore
        Object.values(Teams).map(value => ({ label: value, value }))
    ) as Array<ItemProps>
