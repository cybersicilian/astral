export default class Expirable<Content> {
    private readonly content: Content;
    private readonly createdTime: number = Date.now();
    private readonly updateInterval: number = 1000;
    private expireTime: number;

    private readonly expireCallback: (obj: Content) => Content = () => {};

    constructor(content: Content, expireTime: number, expireCallback: (obj: Content) => Content = () => {}) {
        this.content = content;
        this.expireTime = this.createdTime + expireTime;
        this.updateInterval = expireTime / 10;

        this.expireCallback = expireCallback;
    }

    get() {
        if (this.isExpired()) {
            return this.expireCallback(this.content);
        } else {
            this.expireTime = Date.now() + this.updateInterval;
            return this.content;
        }
    }

    expire(): Content {
        this.expireTime = 0;
        this.expireCallback(this.content)
    }

    getExpireTime() {
        return this.expireTime;
    }

    isExpired() {
        return this.expireTime < Date.now();
    }

    serialize() {
        return {
            content: this.content,
            expireTime: this.expireTime
        }
    }

    static deserialize<Content>(obj: any): Expirable<Content> {
        return new Expirable<Content>(obj.content, obj.expireTime);
    }
}