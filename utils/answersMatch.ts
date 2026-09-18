export function answersMatch({
    answer,
    expected,
}: {
    answer: string
    expected: string
}): boolean {
    return answer.trim().toLowerCase() === expected.trim().toLowerCase()
}
