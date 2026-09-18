// noinspection CssMissingComma

import styled from 'styled-components'

export const GradedResponseContainer = styled.div`
    .ant-table-thead > tr > th {
        background-color: ${props => props.theme['tofu-brand-0']};
    }

    .ant-table-tbody > tr > td {
        border-bottom: 1px solid ${props => props.theme['tofu-brand-3']};
    }

    #resources .ant-table-tbody > tr > td {
        border-bottom: 1px solid ${props => props.theme['tofu-brand-4']};
    }

    .ant-table-thead > tr > th {
        font-weight: 700;
        font-size: 0.9rem;
    }

    .ant-table-tbody > tr > td > .ant-table-wrapper:only-child .ant-table,
    .ant-table-tbody,
    > tr,
    > td,
    > .ant-table-expanded-row-fixed,
    > .ant-table-wrapper:only-child,
    .ant-table {
        margin: 0;
    }

    .ant-table.ant-table-middle,
    .ant-table-tbody,
    .ant-table-wrapper:only-child,
    .ant-table {
        margin: 0 !important;
    }

    .ant-table-footer {
        background-color: ${props => props.theme['tofu-brand-4']};
    }

    .ant-table-tbody > tr.ant-table-row:hover > td,
    .ant-table-tbody > tr > td.ant-table-cell-row-hover {
        background-color: ${props => props.theme['tofu-brand-2']};
    }

    #resources .ant-table-tbody > tr.ant-table-row:hover > td,
    .ant-table-tbody > tr > td.ant-table-cell-row-hover {
        background-color: ${props => props.theme['tofu-brand-3']};
    }

    .ant-table-thead > tr > th {
        border-bottom: 1px solid ${props => props.theme['tofu-brand-4']};
    }

    tr.ant-table-expanded-row > td,
    tr.ant-table-expanded-row:hover > td {
        background-color: ${props => props.theme['tofu-brand-1']};
    }

    .ant-table.ant-table-bordered > .ant-table-container {
        border-left: 1px solid ${props => props.theme['tofu-brand-4']};
    }

    .ant-table.ant-table-bordered
        > .ant-table-container
        > .ant-table-content
        > table,
    .ant-table.ant-table-bordered
        > .ant-table-container
        > .ant-table-header
        > table {
        border-top: 1px solid ${props => props.theme['tofu-brand-4']};
    }

    .ant-table.ant-table-bordered
        > .ant-table-container
        > .ant-table-content
        > table
        > thead
        > tr
        > th {
        border-right: 1px solid ${props => props.theme['tofu-brand-4']};
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

    #resources
        .ant-table.ant-table-bordered
        > .ant-table-container
        > .ant-table-content
        > table
        > tbody
        > tr
        > td {
        border-right: 1px solid ${props => props.theme['tofu-brand-7']};
    }

    #resources .ant-table-tbody {
        background-color: ${props => props.theme['tofu-brand-2']};
    }

    .ant-table-row-expand-icon {
        text-decoration-color: currentcolor;
        color: inherit;
        background-color: rgb(32, 32, 41);
        background-image: none;
        border-color: rgb(52, 57, 59);
        outline-color: currentcolor;
    }

    .ant-table-row-expand-icon:focus,
    .ant-table-row-expand-icon:hover {
        color: ${props => props.theme['tofu-button-green']};
    }

    .ant-collapse {
        background-color: ${props => props.theme['tofu-brand-0']};
        border: 1px solid ${props => props.theme['tofu-brand-4']};
    }

    .ant-collapse-content {
        border-top: 1px solid ${props => props.theme['tofu-brand-4']};
    }

    .ant-collapse > .ant-collapse-item {
        border-bottom: 1px solid ${props => props.theme['tofu-brand-4']};
    }

    .ant-input[disabled] {
        color: rgba(232, 230, 227, 0.25);
        background-color: rgb(30, 32, 33);
        border-color: rgb(99, 92, 82);
        box-shadow: none;
    }

    .ant-segmented {
        list-style-image: none;
        color: rgba(232, 230, 227, 0.65);
        background-color: rgba(0, 0, 0, 0.04);
    }

    .ant-segmented-item-selected {
        background-color: rgb(24, 26, 27);
        box-shadow: rgba(0, 0, 0, 0.05) 0 2px 8px -2px,
            rgba(0, 0, 0, 0.07) 0px 1px 4px -1px,
            rgba(0, 0, 0, 0.08) 0px 0px 1px 0px;
        color: rgb(208, 204, 198);
    }

    .ant-segmented-item:hover,
    .ant-segmented-item:focus {
        color: rgb(208, 204, 198);
    }
`
