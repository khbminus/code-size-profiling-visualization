interface LineNumberProps {
    maximumLength: number,
    index: number
}

export default function LineNumber({maximumLength, index}: LineNumberProps) {
    return <span
        style={{
            width: `${maximumLength}em`,
            textAlign: "left",
            display: "inline-block"
        }}
    >{index + 1}</span>
}