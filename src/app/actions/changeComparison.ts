export type ChangesDto = {
    name: string
    changes: string[],
    count: number
}

export type LowLevelChangeLogRaw = {
    changeLogTitle: string,
    changeLog: string
}

export type LowLevelChangeLog = {
    changeLogTitle: string,
    changeLog: string[]
}

const mapRawTextToChangeArray = (rawText: string): string[] => {
    return rawText.split("\n").map((numberedChange: string): string => {
        const apiIndex: number = numberedChange.indexOf("API");
        return numberedChange.substring(apiIndex);
    })
}

const findAndAddSemiMappedChanges = (highLevelChange: string, lowLevelChange: string, isMatch: boolean, semiMappedChanges: string[]): boolean => {
    const regex: RegExp = / \-\>.+?]/;
    const regexMatch: RegExpMatchArray | null = highLevelChange.match(regex);
    if (!regexMatch) return false
    const regexMatchIndex: number = regexMatch.index || 0
    const newStringMatch: string = `${highLevelChange.slice(0, regexMatchIndex)}${highLevelChange.slice(
        regexMatchIndex + regexMatch[0].length - 1, 
        highLevelChange.length)}`
    if (newStringMatch === lowLevelChange) {
        semiMappedChanges.push(`High Level Change: ${highLevelChange}\nLow Level Change: ${lowLevelChange}\n`)
        return true
    }
    return false
}

const findUnmappedLowLevelChanges = (lowLevelChangeLogs: LowLevelChangeLog[], isLowLevelChangeLogsMatched: boolean[][]): string[] => {
    const unmappedLowLevelChanges: string[] = []
    lowLevelChangeLogs.forEach((lowLevelChangeLog, lowLevelChangeLogIndex) => {
        isLowLevelChangeLogsMatched[lowLevelChangeLogIndex].forEach((isLowLevelChangeMatched, matchIndex) => {
            if (!isLowLevelChangeMatched) {
                unmappedLowLevelChanges.push(`${lowLevelChangeLog.changeLogTitle} - ${lowLevelChangeLog.changeLog[matchIndex]}`)
            }
        })
    })
    return unmappedLowLevelChanges
}

export const compareChangeLogs = (highLevelChangeLogRaw: string, lowLevelChangeLogsRaw: LowLevelChangeLogRaw[]): ChangesDto[] => {
    const lowLevelChangeLogs: LowLevelChangeLog[] = lowLevelChangeLogsRaw.map(lowLevelChangeLogRaw => {
        return {
            changeLogTitle: lowLevelChangeLogRaw.changeLogTitle, 
            changeLog: mapRawTextToChangeArray(lowLevelChangeLogRaw.changeLog)
        }})
    const isLowLevelChangeLogsMatched: boolean[][] = lowLevelChangeLogs.map(lowLevelChangeLog => new Array(lowLevelChangeLog.changeLog.length).fill(false))

    const unmappedHighLevelChanges: string[] = []
    const semiMappedChanges: string[] = []
    const duplicateChanges: string[] = []
    const highLevelChangeLog = mapRawTextToChangeArray(highLevelChangeLogRaw)
    highLevelChangeLog.forEach(highLevelChange => {
        let matchCount = 0;
        const matchedChangeLogTitles: string[] = []
        lowLevelChangeLogs.forEach((lowLevelChangeLog, lowLevelChangeLogIndex) => {
            lowLevelChangeLog.changeLog.forEach((lowLevelChange, changeIndex) => {
                let isMatch = false;
                if (highLevelChange === lowLevelChange) isMatch = true
                const isSemiMappedChange = findAndAddSemiMappedChanges(highLevelChange, lowLevelChange, isMatch, semiMappedChanges)
                if (isMatch || isSemiMappedChange) {
                    matchCount += 1
                    matchedChangeLogTitles.push(lowLevelChangeLog.changeLogTitle)
                    isLowLevelChangeLogsMatched[lowLevelChangeLogIndex][changeIndex] = true
                }
            })
        })
        if (matchCount === 0) {
            unmappedHighLevelChanges.push(highLevelChange)
        } else if (matchCount > 1) {
            duplicateChanges.push(`${matchedChangeLogTitles.join(", ")} - ${highLevelChange}`)
        }
    })
    const unmappedLowLevelChanges = findUnmappedLowLevelChanges(lowLevelChangeLogs, isLowLevelChangeLogsMatched)

    return [
        {name: "Duplicate Changes", changes: duplicateChanges, count: duplicateChanges.length},
        {name: "Unmapped Low Level Changes", changes: unmappedLowLevelChanges, count: unmappedLowLevelChanges.length},
        {name: "Unmapped High Level Changes", changes: unmappedHighLevelChanges, count: unmappedHighLevelChanges.length},
        {name: "Semi-Mapped Changes", changes: semiMappedChanges, count: semiMappedChanges.length}
    ]
}