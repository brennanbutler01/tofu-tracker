import styled from 'styled-components'

export const TableContainer = styled.div`
    //updates the title row for the table
    .ant-table-thead > tr > th {
        background-color: ${props => props.theme['tofu-brand-0']};
        border-bottom: 1px solid ${props => props.theme['tofu-brand-6']};
        font-weight: 700;
        font-size: 1.1rem;
    }
    .ant-table.ant-table-bordered
        > .ant-table-container
        > .ant-table-content
        > table
        > tbody
        > tr
        > td {
        border-right: 1px solid ${props => props.theme['tofu-brand-4']};
    }
    //updates table row on hover
    .ant-table-tbody > tr.ant-table-row:hover > td,
    .ant-table-tbody > tr > td.ant-table-cell-row-hover {
        background-color: ${props => props.theme['tofu-brand-3']};
    }

    //row body
    .ant-table-tbody > tr > td {
        border-bottom: 1px solid ${props => props.theme['tofu-brand-6']};
    }

    //expanded row
    .ant-table-tbody > .ant-table-expanded-row > td {
        background-color: ${props => props.theme['tofu-brand-3']};
    }

    //table background
    .ant-table {
        background-color: ${props => props.theme['tofu-brand-2']};
    }

    //selected table
    .ant-table-tbody > tr.ant-table-row-selected > td {
        background-color: ${props => props.theme['tofu-green-background']};
    }

    .ant-table.ant-table-middle
        .ant-table-tbody
        .ant-table-wrapper:only-child
        .ant-table {
        margin: 0;
    }
`
