import { TreeDataNode, TreeSelect } from 'antd'
import React from 'react'
import styled from 'styled-components'
import { useGameDeckSWR } from '@/services/decks/game/useGameDeckSWR'

const TreeWrapper = styled.div`
    //our tag items
    .ant-select-multiple .ant-select-selection-item {
        background-color: ${props => props.theme['tofu-green-background']};
        border: 1px solid ${props => props.theme['tofu-brand-6']};
    }

    // the x on the tags
    .ant-select-multiple .ant-select-selection-item-remove:hover {
        color: ${props => props.theme['tofu-yellow']};
    }

    // when hovering in the select menu
    .ant-select-tree .ant-select-tree-node-content-wrapper:hover {
        background-color: ${props => props.theme['tofu-brand-2']};
    }
`

export interface ITreeData {
    value: Array<TreeDataNode>
    onChange: React.Dispatch<React.SetStateAction<Array<TreeDataNode>>>
}

const DeckQuestionTree = ({ value, onChange }: ITreeData) => {
    const ourDecks = useGameDeckSWR()

    const treeData = ourDecks?.reduce((acc, deck) => {
        return deck.questions.length > 0
            ? [
                  ...acc,
                  {
                      title: deck.title,
                      value: `d-${deck.id}`,
                      key: `d-${deck.id}`,
                      children: deck.questions.map(question => ({
                          title: question.question,
                          value: `q-${question.id}`,
                          key: `q-${question.id}`,
                      })),
                  } as TreeDataNode,
              ]
            : acc
    }, [] as Array<TreeDataNode>)

    console.log(value, treeData)

    return (
        <TreeWrapper>
            <TreeSelect
                value={value}
                treeCheckable={true}
                showCheckedStrategy={TreeSelect.SHOW_PARENT}
                placeholder={'Customize learning'}
                filterTreeNode={(inputValue, treeNode) => {
                    const ourNode = treeNode as TreeDataNode
                    //sanitize + search for nodes by title
                    return ourNode.title
                        ? ourNode?.title
                              ?.toString()
                              ?.toLowerCase()
                              ?.trim()
                              ?.includes(inputValue.toLowerCase().trim())
                        : true
                }}
                multiple
                treeData={treeData}
                onChange={onChange}
                dropdownStyle={{ minWidth: '300px' }}
                style={{ minWidth: '220px' }}
                showSearch
                getPopupContainer={el => el.parentNode as HTMLElement}
            />
        </TreeWrapper>
    )
}

export default DeckQuestionTree
