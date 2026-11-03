{
  description = "Dev shell for vera.lgbt (Astro + embedded Sanity Studio)";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs =
    {
      self,
      nixpkgs,
      flake-utils,
    }:
    flake-utils.lib.eachDefaultSystem (
      system:
      let
        pkgs = import nixpkgs { inherit system; };
      in
      {
        devShells.default = pkgs.mkShell {
          # biome, esbuild, sharp and typst-ts-node-compiler ship prebuilt binaries via pnpm (runs through nix-ld)
          packages = with pkgs; [
            nodejs_22
            pnpm
          ];

          shellHook = ''
            export PATH="$PWD/node_modules/.bin:$PATH"
          '';
        };
      }
    );
}
