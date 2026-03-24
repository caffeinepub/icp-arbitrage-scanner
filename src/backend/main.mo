import Outcall "http-outcalls/outcall";
import Time "mo:core/Time";

actor {
  stable var lastFetchTime : Int = 0;
  stable var icpSwapData : Text = "";
  stable var kongSwapData : Text = "";
  stable var neutriniteData : Text = "";

  public query func transform(input : Outcall.TransformationInput) : async Outcall.TransformationOutput {
    Outcall.transform(input);
  };

  public func fetchICPSwap() : async Text {
    let result = await Outcall.httpGetRequest(
      "https://uvevg-iyaaa-aaaak-ac27q-cai.raw.icp0.io/tokens",
      [],
      transform
    );
    icpSwapData := result;
    result
  };

  public func fetchKongSwap() : async Text {
    let result = await Outcall.httpGetRequest(
      "https://edoy4-liaaa-aaaar-qakha-cai.raw.icp0.io/api/tokens",
      [],
      transform
    );
    kongSwapData := result;
    result
  };

  public func fetchNeutrinite() : async Text {
    let result = await Outcall.httpGetRequest(
      "https://n7ib3-4qaaa-aaaai-qagnq-cai.raw.icp0.io/tokens",
      [],
      transform
    );
    neutriniteData := result;
    result
  };

  public func refreshAll() : async { icpswap: Text; kongswap: Text; neutrinite: Text; timestamp: Int } {
    let icpswap = await fetchICPSwap();
    let kongswap = await fetchKongSwap();
    let neutrinite = await fetchNeutrinite();
    lastFetchTime := Time.now();
    { icpswap; kongswap; neutrinite; timestamp = lastFetchTime }
  };

  public query func getCachedData() : async { icpswap: Text; kongswap: Text; neutrinite: Text; timestamp: Int } {
    { icpswap = icpSwapData; kongswap = kongSwapData; neutrinite = neutriniteData; timestamp = lastFetchTime }
  };

  public query func getLastFetchTime() : async Int {
    lastFetchTime
  };

  system func heartbeat() : async () {
    let fiveMinutes = 5 * 60 * 1_000_000_000;
    if (Time.now() - lastFetchTime > fiveMinutes) {
      ignore await refreshAll();
    };
  };
};
