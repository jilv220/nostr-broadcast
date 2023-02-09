export function getTimeDiff(event) {
    const evDate = new Date(event.created_at * 1000)
    const now = new Date()
    const diff = (now - evDate) / (1000 * 60 * 60)
    return diff
}

export async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}