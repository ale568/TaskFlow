class Tag {
    constructor(name, color) {
        this.setName(name);
        this.setColor(color);
    }

    setName(name) {
        if (!name) {
            throw new Error("Tag's name cannot be empty");
        }
        this.name = name;
    }

    setColor(color) {
        const hexColorPattern = /^#([0-9A-F]{3}){1,2}$/i;
        if (!hexColorPattern.test(color)) {
            throw new Error("Color's format is not valid");
        }
        this.color = color;
    }
}

module.exports = Tag;