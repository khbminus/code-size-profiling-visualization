interface MinimumSizeProps {
    minimumRadius: number,
    setRadius: (r: number) => void,
    minSize: number,
    maxSize: number,
    viewMode: string
}

export default function MinimumSizeChooser(
    {
        minimumRadius,
        setRadius,
        minSize,
        maxSize,
        viewMode
    }: MinimumSizeProps) {
    return <div className="minimum-size-chooser">
        <label htmlFor="minimumSize" className="size-label">{
            viewMode === "shallow"
                ? "Minimum shallow size to display:"
                : "Minimum retained size to display:"
        }
        </label>
        <input type="range"
               id="minimumSize"
               name="minimumSize"
               value={minimumRadius}
               onChange={e => setRadius(e.target.valueAsNumber)}
               min={minSize}
               max={maxSize}
        />
        <span className="minimum-size-viewer">{minimumRadius}</span>
    </div>
}