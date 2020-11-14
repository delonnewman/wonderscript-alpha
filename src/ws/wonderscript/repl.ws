;(ns wonderscript.repl)

(defn repl.input ()
  (html [:textarea]))

(defn repl.load ()
  (.write js/document (repl.input)))