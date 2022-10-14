// Formats timestamps for comments

export default function tFormatter(num: any, digits: any) {
    const lookup = [
      { value: 1, symbol: "s" },
      { value: 60, symbol: "m" },
      { value: 3600, symbol: "h" },
      { value: 86400, symbol: "d" },
      { value: 604800, symbol: "w" },
      { value: 2419200, symbol: "m" },
      { value: 29030400, symbol: "y" }
    ];
    const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
    var item = lookup.slice().reverse().find(function(item) {
      return num >= item.value;
    });
    return item ? (num / item.value).toFixed(digits).replace(rx, "$1") + item.symbol : "0";
}