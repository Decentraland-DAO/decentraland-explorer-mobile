export class Utils {
    private ethFormatter = new Intl.NumberFormat("en-US", {
        minimumFractionDigits: 0
    });

    formatPrice(val: number): string {
        return this.ethFormatter.format(val);
    }
}
