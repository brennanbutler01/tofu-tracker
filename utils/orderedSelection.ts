export function orderedSelection(
    selected: string[] = [],
    order: string[] = []
) {
    return [
        ...new Set([...order.filter(id => selected.includes(id)), ...selected]),
    ]
}
