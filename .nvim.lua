vim.api.nvim_create_autocmd({ "FileType" },
  {
    pattern = "astro",
    callback = function()
      -- local wk = require('which-key')
      vim.keymap.set("n", "<leader>;f", "<esc>:%!npx prettier --stdin-filepath \"%\"<CR>", { silent = true, noremap = true })
      -- vim.notify("in astro file")
    end
  }
)

require('lspconfig').astro.setup({
  filetypes = { "astro", "typescript" }
})
require('lspconfig').tsserver.setup({})
-- require('lspconfig').denols.setup({})

