import { Tag, Input, Tooltip } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import React, { ChangeEvent, useEffect, useRef, useState } from 'react'
import styled from 'styled-components'

type InputChange = ChangeEvent<HTMLInputElement>

export type TagsType = Array<string>

interface IResourceTags {
    value: TagsType
    onChange: React.Dispatch<React.SetStateAction<TagsType>>
}

const TagContainer = styled.div`
    &&& {
        .ant-tag {
            background-color: ${props => props.theme['tofu-brand-3']};
            border: 1px solid ${props => props.theme['tofu-brand-5']};
        }
    }
`

// noinspection JSUnusedLocalSymbols
const ResourceTags = ({ value, onChange }: IResourceTags) => {
    const [inputVisible, setInputVisible] = useState(false)
    const [inputValue, setInputValue] = useState('')
    const [editInputIndex, setEditInputIndex] = useState(-1)
    const [editInputValue, setEditInputValue] = useState('')
    const [tags, setTags] = useState<TagsType>([])

    useEffect(() => {
        onChange(tags)
    }, [tags, onChange])

    const input = useRef<any>(null)

    const handleClose = (removedTag: string) =>
        setTags(tags.filter(tag => tag !== removedTag))

    const showInput = () => {
        setInputVisible(true)
        input?.current?.focus()
    }

    const handleInputChange = (e: InputChange) => setInputValue(e.target.value)

    const handleInputConfirm = () => {
        // if (inputValue && value?.indexOf(inputValue) === -1) {
        setTags([...tags, inputValue])
        // }
        setInputVisible(false)
        setInputValue('')
    }

    const handleEditInputChange = (e: InputChange) =>
        setEditInputValue(e.target.value)

    const handleEditInputConfirm = () => {
        const newTags = [...tags]
        newTags[editInputIndex] = editInputValue

        setTags(newTags)
        setEditInputIndex(-1)
        setEditInputValue('')
    }

    return (
        <TagContainer>
            {tags?.map((tag, index) => {
                if (editInputIndex === index) {
                    return (
                        <Input
                            ref={input}
                            key={tag}
                            size='small'
                            value={editInputValue}
                            onChange={handleEditInputChange}
                            onBlur={handleEditInputConfirm}
                            onPressEnter={handleEditInputConfirm}
                        />
                    )
                }

                const isLongTag = tag.length > 20

                const editTag = (e: React.MouseEvent<HTMLSpanElement>) => {
                    if (index !== 0) {
                        setEditInputValue(tag)
                        setEditInputIndex(index)
                    }

                    if (input?.current) {
                        input?.current?.focus()
                    }

                    e.preventDefault()
                }

                const tagElem = (
                    <Tag
                        key={tag}
                        closable={index !== 0}
                        onClose={() => handleClose(tag)}
                    >
                        <span onDoubleClick={editTag}>
                            {isLongTag ? `${tag.slice(0, 20)}...` : tag}
                        </span>
                    </Tag>
                )
                return isLongTag ? (
                    <Tooltip title={tag} key={tag}>
                        {tagElem}
                    </Tooltip>
                ) : (
                    tagElem
                )
            })}
            {inputVisible && (
                <Input
                    ref={input}
                    type='text'
                    size='small'
                    value={inputValue}
                    onChange={handleInputChange}
                    onBlur={handleInputConfirm}
                    onPressEnter={handleInputConfirm}
                />
            )}
            {!inputVisible && (
                <Tag onClick={showInput}>
                    <PlusOutlined /> New Tag
                </Tag>
            )}
        </TagContainer>
    )
}

export default ResourceTags
